import { IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateItemDto {
  /**
   * The name of the item.
   *
   * Leading and trailing whitespaces are trimmed.
   * @example "Gorgonzola"
   */
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;
}
