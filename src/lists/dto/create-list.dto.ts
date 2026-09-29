import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateListDto {
  /**
   * The title of the list. Leading and trailing whitespaces are trimmed.
   * @example "Leroy Merlin"
   */
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;
}
