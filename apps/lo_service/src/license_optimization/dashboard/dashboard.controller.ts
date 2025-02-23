import { Body, Controller, Post } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

type getUserStatusDto = {
  customer_id: number;
  hdrId: number;
};

type getActiveUsersDetailsDTO = {
  customer_id: number;
  hdrId: number;
};

@Controller("lo/dashboard")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Post("users")
  async getUsersStatus(@Body() userStatus: getUserStatusDto) {
    return await this.dashboardService.getUsersStatus(userStatus);
  }

  @Post("get-dashboard-data")
  async getDashboardData(@Body() userStatus: getUserStatusDto) {
    return await this.dashboardService.getDashboardData(userStatus);
  }

  @Post("get-active-users-roles")
  async getActiveUsersRolesData(
    @Body() getActiveUsersRolesDto: getActiveUsersDetailsDTO,
  ) {
    return await this.dashboardService.getActiveUsersRolesData(
      getActiveUsersRolesDto,
    );
  }

  @Post("get-active-users-roles-details")
  async getActiveUsersRolesTcodeData(
    @Body() getActiveUsersRoleDetailsDto: getActiveUsersDetailsDTO,
  ) {
    return await this.dashboardService.getActiveUsersRolesDetails(
      getActiveUsersRoleDetailsDto,
    );
  }

  @Post("get-active-users-roles-usage")
  async getActiveUsersRolesUsageData(
    @Body() getActiveUsersRolesUsageDto: getActiveUsersDetailsDTO,
  ) {
    return await this.dashboardService.getActiveUsersRolesUsage(
      getActiveUsersRolesUsageDto,
    );
  }

  @Post("get-active-users-roles-usage-count")
  async getActiveUsersRolesUsageCountData(
    @Body() getActiveUsersRolesUsageCountDto: getActiveUsersDetailsDTO,
  ) {
    return await this.dashboardService.getActiveUsersRolesUsageCount(
      getActiveUsersRolesUsageCountDto,
    );
  }
}
