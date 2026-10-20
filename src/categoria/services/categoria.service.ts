import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    return await this.categoriaRepository.find({
      relations: {
        produto: true,
      },
    });
  }

  async findById(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: {
        id,
      },
      relations: {
        produto: true,
      },
    });

    if (!categoria)
      throw new HttpException('Id não encontrado', HttpStatus.NOT_FOUND);
    return categoria;
  }

  async findByDescricao(descricao: string): Promise<Categoria[]> {
    return await this.categoriaRepository.find({
      where: {
        descricao: ILike(`%${descricao}`),
      },
      relations: {
        produto: true,
      },
    });
  }

  async create(categoria: Categoria): Promise<Categoria> {
    return await this.categoriaRepository.save(categoria);
  }

  async update(categoria: Categoria): Promise<Categoria> {
    await this.findById(categoria.id);
    return await this.categoriaRepository.save(categoria);
  }

  // Apagar a categoria apagaria em cascata os produtos de todos os usuários,
  // então só é permitido quando ela está vazia.
  async delete(id: number): Promise<DeleteResult> {
    const categoria = await this.findById(id);

    if (categoria.produto?.length)
      throw new ConflictException(
        'Não é possível apagar uma categoria que ainda tem produtos!',
      );

    return await this.categoriaRepository.delete(id);
  }
}
