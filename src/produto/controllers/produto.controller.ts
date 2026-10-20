import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { Produto } from '../entities/produto.entity';
import { ProdutoService } from './../services/produto.service';
import { RequisicaoAutenticada } from '../../auth/types/usuario-autenticado';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';

@ApiTags('Produtos')
@UseGuards(JwtAuthGuard)
@Controller('/produtos')
@ApiBearerAuth()
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Produto[]> {
    return this.produtoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Produto> {
    return this.produtoService.findById(id);
  }

  @Get('/descricao/:descricao')
  @HttpCode(HttpStatus.OK)
  findAllBydescricao(
    @Param('descricao') descricao: string,
  ): Promise<Produto[]> {
    return this.produtoService.findAllByDescricao(descricao);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() produto: Produto,
    @Request() req: RequisicaoAutenticada,
  ): Promise<Produto> {
    return this.produtoService.create(produto, req.user.id);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(
    @Body() produto: Produto,
    @Request() req: RequisicaoAutenticada,
  ): Promise<Produto> {
    return this.produtoService.update(produto, req.user.id);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequisicaoAutenticada,
  ) {
    return this.produtoService.delete(id, req.user.id);
  }
}
