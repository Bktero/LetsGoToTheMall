import { PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto.js';
import { IsBoolean, ValidateIf } from 'class-validator';

// skipNullProperties: false makes inherited fields skip validation only when
// undefined, so an explicit null is still validated (and rejected).
export class UpdateItemDto extends PartialType(CreateItemDto, {
  skipNullProperties: false,
}) {
  /**
   * Whether the item has been picked up.
   */
  // Same rule as the inherited fields: absent means "no change", null is
  // rejected. @IsOptional() would let null through.
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  pickedUp?: boolean;
}
