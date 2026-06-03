import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';

export interface ImportRow {
  title: string;
  slug: string;
  brand: string;
  description?: string;
  basePriceCents: number;
  categoryName: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

@Injectable()
export class CatalogImportService {
  private readonly logger = new Logger(CatalogImportService.name);

  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
  ) {}

  parseCsv(csvText: string): ImportRow[] {
    const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new BadRequestException('CSV must have a header row and at least one data row');

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    const required = ['title', 'slug', 'brand', 'basepricecents', 'categoryname'];
    for (const req of required) {
      if (!headers.includes(req)) {
        throw new BadRequestException(`Missing required CSV column: ${req}`);
      }
    }

    return lines.slice(1).map((line) => {
      const values = this.splitCsvLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i]?.replace(/^"|"$/g, '') ?? ''; });

      return {
        title: row['title'],
        slug: row['slug'],
        brand: row['brand'],
        description: row['description'] || '',
        basePriceCents: parseInt(row['basepricecents'] ?? '0', 10),
        categoryName: row['categoryname'],
        imageUrl: row['imageurl'] || undefined,
        isActive: row['isactive'] !== 'false',
      };
    });
  }

  private splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { result.push(current); current = ''; continue; }
      current += ch;
    }
    result.push(current);
    return result;
  }

  async importRows(rows: ImportRow[]): Promise<ImportResult> {
    const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
    const categoryCache = new Map<string, Category>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      if (!row.title || !row.slug || !row.brand || !row.categoryName) {
        result.errors.push({ row: rowNum, message: 'Missing required fields' });
        result.skipped++;
        continue;
      }

      if (isNaN(row.basePriceCents) || row.basePriceCents < 0) {
        result.errors.push({ row: rowNum, message: 'Invalid basePriceCents' });
        result.skipped++;
        continue;
      }

      try {
        let category = categoryCache.get(row.categoryName.toLowerCase());
        if (!category) {
          category = await this.categoryRepo.findOne({ where: { name: row.categoryName } }) ?? undefined;
          if (!category) {
            category = await this.categoryRepo.save(
              this.categoryRepo.create({
                name: row.categoryName,
                slug: row.categoryName.toLowerCase().replace(/\s+/g, '-'),
              })
            );
          }
          categoryCache.set(row.categoryName.toLowerCase(), category);
        }

        const existing = await this.productRepo.findOne({ where: { slug: row.slug } });
        const images = row.imageUrl ? [{ url: row.imageUrl, alt: row.title }] : [];

        if (existing) {
          await this.productRepo.update(existing.id, {
            title: row.title,
            brand: row.brand,
            description: row.description ?? existing.description,
            basePriceCents: row.basePriceCents,
            categoryId: category.id,
            isActive: row.isActive ?? existing.isActive,
            ...(images.length > 0 && { images }),
          });
          result.updated++;
        } else {
          await this.productRepo.save(
            this.productRepo.create({
              title: row.title,
              slug: row.slug,
              brand: row.brand,
              description: row.description ?? '',
              basePriceCents: row.basePriceCents,
              categoryId: category.id,
              isActive: row.isActive ?? true,
              images,
            })
          );
          result.created++;
        }
      } catch (err) {
        this.logger.error({ row: rowNum, err }, 'Failed to import row');
        result.errors.push({ row: rowNum, message: (err as Error).message });
        result.skipped++;
      }
    }

    this.logger.log(result, 'Product import complete');
    return result;
  }
}
