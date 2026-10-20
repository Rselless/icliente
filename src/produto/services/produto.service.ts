import { CategoriaService } from './../../categoria/services/categoria.service';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Produto } from '../entities/produto.entity';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
    private categoriaService: CategoriaService,
  ) {}

  async findAll(): Promise<Produto[]> {
    return await this.produtoRepository.find({
      relations: {
        categoria: true,
      },
    });
  }

  async findById(id: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({
      where: {
        id,
      },
      relations: { categoria: true },
    });
    if (!produto)
      throw new HttpException('produto não encontrado!', HttpStatus.NOT_FOUND);
    return produto;
  }

  async findAllByDescricao(descricao: string): Promise<Produto[]> {
    return await this.produtoRepository.find({
      where: {
        descricao: ILike(`%${descricao}%`),
      },
      relations: { categoria: true },
    });
  }

  // O dono vem sempre do token; um "usuario" enviado no corpo é ignorado.
  async create(produto: Produto, usuarioId: number): Promise<Produto> {
    await this.categoriaService.findById(produto.categoria.id);
    produto.usuario = { id: usuarioId } as Usuario;
    return await this.produtoRepository.save(produto);
  }

  async update(produto: Produto, usuarioId: number): Promise<Produto> {
    await this.garantirDono(produto.id, usuarioId);
    await this.categoriaService.findById(produto.categoria.id);
    produto.usuario = { id: usuarioId } as Usuario;
    return await this.produtoRepository.save(produto);
  }

  async delete(id: number, usuarioId: number): Promise<DeleteResult> {
    await this.garantirDono(id, usuarioId);
    return await this.produtoRepository.delete(id);
  }

  // 404 se o produto não existe; 403 se existe mas pertence a outro usuário.
  private async garantirDono(id: number, usuarioId: number): Promise<void> {
    const produto = await this.produtoRepository.findOne({
      where: { id },
      relations: { usuario: true },
    });

    if (!produto)
      throw new HttpException('produto não encontrado!', HttpStatus.NOT_FOUND);

    if (produto.usuario?.id !== usuarioId)
      throw new ForbiddenException(
        'Você só pode alterar ou apagar os próprios produtos!',
      );
  }
}
