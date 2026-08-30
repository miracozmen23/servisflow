import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { UserRole } from '../generated/prisma/client';
import { CreateServiceNoteDto } from './dto/create-service-note.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ListServiceRequestsQueryDto } from './dto/list-service-requests-query.dto';
import { UpdateServiceRequestStatusDto } from './dto/update-service-request-status.dto';
import type {
  ServiceNoteView,
  ServiceRequestDetail,
  ServiceRequestView,
} from './service-request.presenter';
import {
  ServiceRequestsService,
  type ServiceRequestListResult,
} from './service-requests.service';

interface ServiceRequestResponse {
  data: ServiceRequestView;
}

interface ServiceRequestDetailResponse {
  data: ServiceRequestDetail;
}

interface ServiceNoteResponse {
  data: ServiceNoteView;
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
  ): Promise<ServiceRequestResponse> {
    const serviceRequest = await this.serviceRequestsService.create(
      user.id,
      dto,
    );

    return { data: serviceRequest };
  }

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'List role-scoped service requests' })
  @ApiOkResponse({ description: 'Paginated service requests returned.' })
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListServiceRequestsQueryDto,
  ): Promise<ServiceRequestListResult> {
    return this.serviceRequestsService.list(user, query);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Get a role-projected service request detail' })
  @ApiOkResponse({ description: 'Service request detail returned.' })
  @ApiNotFoundResponse({ description: 'Service request was not found.' })
  async getDetail(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) requestId: string,
  ): Promise<ServiceRequestDetailResponse> {
    const serviceRequest = await this.serviceRequestsService.getDetail(
      user,
      requestId,
    );

    return { data: serviceRequest };
  }

  @Patch(':id/status')
  @Roles(UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Apply a controlled service status transition' })
  @ApiOkResponse({ description: 'Service request status updated.' })
  @ApiForbiddenResponse({ description: 'Technician role is required.' })
  @ApiNotFoundResponse({ description: 'Service request was not found.' })
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) requestId: string,
    @Body() dto: UpdateServiceRequestStatusDto,
  ): Promise<ServiceRequestResponse> {
    const serviceRequest = await this.serviceRequestsService.updateStatus(
      user.id,
      requestId,
      dto,
    );

    return { data: serviceRequest };
  }

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Add an internal technician note' })
  @ApiCreatedResponse({ description: 'Internal note created.' })
  @ApiForbiddenResponse({ description: 'Technician role is required.' })
  @ApiNotFoundResponse({ description: 'Service request was not found.' })
  async addNote(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) requestId: string,
    @Body() dto: CreateServiceNoteDto,
  ): Promise<ServiceNoteResponse> {
    const note = await this.serviceRequestsService.addNote(
      user.id,
      requestId,
      dto,
    );

    return { data: note };
  }
}
