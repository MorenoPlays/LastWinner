import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentParticipantDto } from './create-tournament-participant.dto';

export class UpdateTournamentParticipantDto extends PartialType(CreateTournamentParticipantDto) {}
