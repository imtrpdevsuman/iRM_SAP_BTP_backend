import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwtAuth.guard';
import { Request } from 'express';
import { AuthService } from '../../auth/src';
import { DashboardService } from './dashboard.service';

type getControlDetailsDTO = {
  id : number;
  hdrId : number;
}

// @UseGuards(JwtAuthGuard)
@Controller('dashboard')
// Add metadata
export class DashboardController {
  constructor(
    private dashboardService : DashboardService,
    private authService: AuthService
  ) {}

  @Get('get-hello')
  getHello(@Req() req: Request) {
    if (!this.authService.ValidatePrivileges(req, 'dashboard', 'landing_page', 'create')) {
      throw new ForbiddenException(
        'You are not authorized to perform this operation',
      );
    }
    return 'Hello from dashboard controller!';
  }

  @Get('control-checkpoints')
  async getControlCheckpoints() {
    return await this.dashboardService.getControlCheckPoints();
  }

  @Post('get-control-data')
  async getControlData(@Body() controlDetails: getControlDetailsDTO) {
    return await this.dashboardService.getControlData(controlDetails);
  }
}
