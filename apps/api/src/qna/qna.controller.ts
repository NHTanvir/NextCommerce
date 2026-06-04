import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QnaService, AskQuestionDto, AnswerQuestionDto } from './qna.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '@nextcommerce/shared';

@ApiTags('qna')
@Controller('qna')
export class QnaController {
  constructor(private readonly qnaService: QnaService) {}

  @Get()
  @ApiOperation({ summary: 'Get Q&A for a product' })
  getForProduct(@Query('productId') productId: string) {
    return this.qnaService.getForProduct(productId);
  }

  @Post('ask')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ask a question about a product' })
  ask(@Body() dto: AskQuestionDto, @CurrentUser() user: UserPayload) {
    return this.qnaService.askQuestion(user.sub, dto);
  }

  @Post(':id/answer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Answer a question' })
  answer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AnswerQuestionDto,
    @CurrentUser() user: UserPayload,
  ) {
    const isAdmin = user.role === 'admin';
    return this.qnaService.answerQuestion(id, user.sub, dto, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own question (admin can delete any)' })
  deleteQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.qnaService.deleteQuestion(id, user.sub, user.role === 'admin');
  }

  @Patch(':id/hide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Hide a question' })
  hideQuestion(@Param('id', ParseUUIDPipe) id: string) {
    return this.qnaService.hideQuestion(id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all questions with pagination' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.qnaService.findAllForAdmin(page ? Number(page) : 1, limit ? Number(limit) : 20);
  }
}
