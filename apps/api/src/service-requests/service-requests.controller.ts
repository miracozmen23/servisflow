import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import type { AuthUser } from '../auth/auth.types';
import { UserRole } from '../generated/prisma/client';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import {
  ServiceRequestsService,
  type ServiceRequestView,
} from './service-requests.service';

interface CreateServiceRequestResponse {
  data: ServiceRequestView;
}

@ApiTags('Service Requests')
@ApiCookieAuth()
@Controller('service-requests')
@UseGuards(SessionAuthGuard, RolesGuard)
export class ServiceRequestsController {
  constructor(
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a warranty-aware service request' })
  @ApiCreatedResponse({ description: 'Service request created.' })
  @ApiUnauthorizedResponse({ description: 'Session is invalid or expired.' })
  @ApiForbiddenResponse({ description: 'Customer role is required.' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateServiceRequestDto,
  ): Promise<CreateServiceRequestResponse> {
    const serviceRequest = await this.serviceRequestsService.create(
      user.id,
      dto,
    );

    return { data: serviceRequest };
  }
}
