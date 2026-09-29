import { PartialType } from '@nestjs/swagger';
import { CreateListDto } from './create-list.dto.js';

// skipNullProperties: false makes fields skip validation only when undefined,
// so an explicit null is still validated (and rejected).
export class UpdateListDto extends PartialType(CreateListDto, {
  skipNullProperties: false,
}) {}
