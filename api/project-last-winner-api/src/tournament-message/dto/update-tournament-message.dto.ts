import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentMessageDto } from './create-tournament-message.dto';

export class UpdateTournamentMessageDto extends PartialType(CreateTournamentMessageDto) {}
