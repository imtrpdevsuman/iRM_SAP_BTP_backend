import cds from "@sap/cds";

import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class DashboardService {
  async getUsersStatus(userStatus): Promise<any> {
    try {
      const { customer_id, hdrId } = userStatus;
      const db = await cds.connect.to("db");

      let activeUserQuery = `UFLAG NOT IN (32, 64, 128)
        AND DAYS_BETWEEN(TRDAT , CURRENT_DATE) <= 90
        AND SYNC_HEADER_ID = ${hdrId}
        AND CUSTOMER_ID = ${customer_id}`;

      let inactiveUserQuery = `UFLAG IN (32, 64, 128)
        AND DAYS_BETWEEN(TRDAT , CURRENT_DATE) > 90
        AND SYNC_HEADER_ID = ${hdrId}
        AND CUSTOMER_ID = ${customer_id}`;

      let activeUser = await db.run(
        `SELECT DISTINCT
          BNAME AS "User name",
          GLTGV AS "User valid from", 
          GLTGB AS "User valid to", 
          USTYP AS "User Type",
          CLASS AS "User group",
          UFLAG AS "User Lock Status",
          ACCNT AS "Account ID",
          ANAME AS "Creator of the User",
          ERDAT AS "Creation Date of the User",
          TRDAT AS "Last Logon Date",
          LTIME AS "Last Logon Time",
          TZONE AS "Time Zone"
        FROM LO_USR02
        WHERE ${activeUserQuery}`,
      );
      let inactiveUser = await db.run(
        `SELECT DISTINCT
          BNAME AS "User name",
          GLTGV AS "User valid from", 
          GLTGB AS "User valid to", 
          USTYP AS "User Type",
          CLASS AS "User group",
          UFLAG AS "User Lock Status",
          ACCNT AS "Account ID",
          ANAME AS "Creator of the User",
          ERDAT AS "Creation Date of the User",
          TRDAT AS "Last Logon Date",
          LTIME AS "Last Logon Time",
          TZONE AS "Time Zone"
        FROM LO_USR02
        WHERE ${inactiveUserQuery}`,
      );

      console.table(activeUser);
      console.table(inactiveUser);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: {
          activeUsers: activeUser,
          inactiveUsers: inactiveUser,
        },
      };
    } catch (error) {
      console.error("Error fetching in inactive users:", error.message);
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch inactive users",
        data: error,
      };
    }
  }

  //----------DASHBOARD DATA------------
  async getDashboardData(userStatus): Promise<any> {
    try {
      const { customer_id, hdrId } = userStatus;
      const db = await cds.connect.to("db");

      //----------PIE CHART - BASED ON ACTIVE USER BY USER TYPE------------
      let activeUserQuery = `UFLAG NOT IN (32, 64, 128)
        AND DAYS_BETWEEN(TRDAT , CURRENT_DATE) <= 90
        AND SYNC_HEADER_ID = ${hdrId}
        AND CUSTOMER_ID = ${customer_id}`;

      let activeUserTypeData = await db.run(
        `
        SELECT
        USTYP AS "User Type",
        COUNT(USTYP) as "Count"
        FROM LO_USR02
        WHERE ${activeUserQuery}
        GROUP BY USTYP
        `,
      );

      console.table(activeUserTypeData);

      let transformedActiveUserTypeData = {
        series: activeUserTypeData.map((item, index) => ({
          name: item["User Type"],
          items: [
            {
              id: (index + 1).toString(),
              value: item.Count,
              labelDisplay: "LABEL",
              name: item["User Type"],
            },
          ],
        })),
      };

      //----------PIE CHART - BASED ON USER ROLES COUNT BY ROLE ASSIGNED------------
      let activeUserRoleCountData = await db.run(
        `
        WITH DistinctUserRoles AS (
          SELECT DISTINCT
            A."UNAME", 
            A."AGR_NAME"
          FROM 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_AGR_USERS" A
          JOIN 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_USR02" B
          ON 
            A."UNAME" = B."BNAME"
          WHERE 
            B."UFLAG" NOT IN (32, 64, 128)
            AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) <= 90
            AND A."SYNC_HEADER_ID" = ${hdrId}
            AND A."CUSTOMER_ID" = ${customer_id}
            AND B."SYNC_HEADER_ID" = ${hdrId}
            AND B."CUSTOMER_ID" = ${customer_id}
        )
        SELECT 
          "UNAME" as "User Name",
          COUNT("AGR_NAME") AS "Role Count"
        FROM 
          DistinctUserRoles
        GROUP BY 
          "UNAME"
        ORDER BY 
          "UNAME";
        `,
      );

      console.table(activeUserRoleCountData);

      let transformedActiveUserRoleCountData = {
        series: activeUserRoleCountData.map((item, index) => ({
          name: item["User Name"],
          items: [
            {
              id: (index + 1).toString(),
              value: item["Role Count"],
              labelDisplay: "LABEL",
              name: item["User Name"],
            },
          ],
        })),
      };

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: {
          activeUserType: transformedActiveUserTypeData,
          activeUserRoleCount: transformedActiveUserRoleCountData,
        },
      };
    } catch (error) {
      console.error("Error fetching in active users type:", error.message);
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch active users type",
        data: error,
      };
    }
  }

  async getActiveUsersRolesData(getActiveUsersRolesDto): Promise<any> {
    const { customer_id, hdrId } = getActiveUsersRolesDto;

    try {
      const db = await cds.connect.to("db");

      let activeUsersRoles = await db.run(
        `
        SELECT DISTINCT
          A."UNAME", 
          A."AGR_NAME"
        FROM 
          "FF9F2C685CB64B89B27EDD22961BD341"."LO_AGR_USERS" A
        JOIN 
          "FF9F2C685CB64B89B27EDD22961BD341"."LO_USR02" B
        ON 
          A."UNAME" = B."BNAME"
        WHERE 
          B."UFLAG" NOT IN (32, 64, 128)
          AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) <= 90 
          AND A."SYNC_HEADER_ID" = ${hdrId}
          AND A."CUSTOMER_ID" = ${customer_id}
          AND B."SYNC_HEADER_ID" = ${hdrId}
          AND B."CUSTOMER_ID" = ${customer_id}
        ORDER BY 
          A."UNAME" ASC
        `,
      );

      console.table(activeUsersRoles);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: activeUsersRoles,
      };
    } catch (error) {
      console.error("Error fetching active users roles:", error.message);
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Cannot fetch active users roles!",
        data: error,
      };
    }
  }

  async getActiveUsersRolesDetails(getActiveUsersRoleDetailsDto): Promise<any> {
    const { customer_id, hdrId } = getActiveUsersRoleDetailsDto;

    try {
      const db = await cds.connect.to("db");

      let activeUsersRolesDetails = await db.run(
        `
        SELECT DISTINCT
            A."UNAME", 
            A."AGR_NAME", 
            C."LOW",
            C."OBJECT",
            C."FIELD",
            C."AUTH",
            B."UFLAG", 
            B."TRDAT"
        FROM 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_AGR_USERS" A
        JOIN 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_USR02" B
        ON 
            A."UNAME" = B."BNAME"
        JOIN 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_AGR_1251" C
        ON 
            A."AGR_NAME" = C."AGR_NAME"
        WHERE 
            B."UFLAG" NOT IN (32, 64, 128)
            AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) < 90
            AND C.OBJECT = 'S_TCODE'
            AND C.FIELD = 'TCD'
            AND A."SYNC_HEADER_ID" = ${hdrId}
            AND A."CUSTOMER_ID" = ${customer_id}
            AND B."SYNC_HEADER_ID" = ${hdrId}
            AND B."CUSTOMER_ID" = ${customer_id}
            AND C."SYNC_HEADER_ID" = ${hdrId}
            AND C."CUSTOMER_ID" = ${customer_id}
        ORDER BY
            A."UNAME"
          `,
      );

      console.table(activeUsersRolesDetails);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: activeUsersRolesDetails,
      };
    } catch (error) {
      console.error(
        "Error fetching active users roles details:",
        error.message,
      );
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Cannot fetch active users roles details!",
        data: error,
      };
    }
  }

  async getActiveUsersRolesUsage(getActiveUsersRolesUsageDto): Promise<any> {
    const { customer_id, hdrId } = getActiveUsersRolesUsageDto;

    try {
      const db = await cds.connect.to("db");

      let activeUsersRolesUsage = await db.run(
        `
        WITH ActiveUsersDetails AS (
        SELECT DISTINCT
            A."UNAME", 
            A."AGR_NAME", 
            C."LOW",
            C."OBJECT",
            C."FIELD",
            C."AUTH",
            B."UFLAG", 
            B."TRDAT"
        FROM 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_AGR_USERS" A
        JOIN 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_USR02" B
        ON 
            A."UNAME" = B."BNAME"
        JOIN 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_AGR_1251" C
        ON 
            A."AGR_NAME" = C."AGR_NAME"
        WHERE 
            B."UFLAG" NOT IN (32, 64, 128)
            AND DAYS_BETWEEN(B."TRDAT", CURRENT_DATE) < 90
            AND C.OBJECT = 'S_TCODE'
            AND C.FIELD = 'TCD'
            AND A."SYNC_HEADER_ID" = ${hdrId}
            AND A."CUSTOMER_ID" = ${customer_id}
            AND B."SYNC_HEADER_ID" = ${hdrId}
            AND B."CUSTOMER_ID" = ${customer_id}
            AND C."SYNC_HEADER_ID" = ${hdrId}
            AND C."CUSTOMER_ID" = ${customer_id}
        ),
        RolesUsage AS (
          SELECT DISTINCT 
            TRANSACTION_CODE, 
            USER
          FROM 
            "FF9F2C685CB64B89B27EDD22961BD341"."LO_SM20" 
          WHERE 
            TRANSACTION_CODE NOT IN ('S000', 'SESSION_MANAGER')
            AND "SYNC_HEADER_ID" = ${hdrId}
            AND "CUSTOMER_ID" = ${customer_id}
        )
        SELECT DISTINCT
          AUD."UNAME",
          AUD."LOW",
          RU."TRANSACTION_CODE"
          FROM 
            ActiveUsersDetails AUD
          JOIN 
            RolesUsage RU
          ON 
            AUD."UNAME" = RU."USER"
        WHERE 
          AUD."LOW" != RU."TRANSACTION_CODE"
        ORDER BY
          AUD."UNAME"
        `,
      );

      console.table(activeUsersRolesUsage);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: activeUsersRolesUsage,
      };
    } catch (error) {
      console.error(
        "Error fetching active users roles details:",
        error.message,
      );
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Cannot fetch active users roles details!",
        data: error,
      };
    }
  }

  // async getActiveUsersRolesUsageCount(
  //   getActiveUsersRolesUsageCountDto,
  // ): Promise<any> {
  //   const { customer_id, hdrId } = getActiveUsersRolesUsageCountDto;

  //   try {
  //     const db = await cds.connect.to("db");

  //     let activeUsersRolesUsageCount = await db.run(
  //       `
  //       WITH ActiveUsers AS (
  //         SELECT
  //             "BNAME"
  //         FROM
  //             "FF9F2C685CB64B89B27EDD22961BD341"."LO_USR02"
  //         WHERE
  //             "UFLAG" NOT IN (32, 64, 128)
  //             AND DAYS_BETWEEN("TRDAT", CURRENT_DATE) < 90
  //             AND "SYNC_HEADER_ID" = ${hdrId}
  //             AND "CUSTOMER_ID" = ${customer_id}
  //     ),
  //     RolesUsage AS (
  //         SELECT
  //           TRANSACTION_CODE,
  //           USER
  //         FROM
  //           "FF9F2C685CB64B89B27EDD22961BD341"."LO_SM20"
  //         WHERE
  //           TRANSACTION_CODE NOT IN ('S000', 'SESSION_MANAGER')
  //           AND "SYNC_HEADER_ID" = ${hdrId}
  //           AND "CUSTOMER_ID" = ${customer_id}
  //       )
  //     SELECT
  //         AU."BNAME",
  //         RU."TRANSACTION_CODE",
  //         COUNT(RU."TRANSACTION_CODE") AS "TRANSACTION_COUNT"
  //     FROM
  //         ActiveUsers AU
  //     JOIN
  //         RolesUsage RU
  //     ON
  //         AU."BNAME" = RU."USER"
  //     GROUP BY
  //         AU."BNAME", RU."TRANSACTION_CODE"
  //     ORDER BY
  //         AU."BNAME", "TRANSACTION_COUNT" DESC;
  //       `,
  //     );

  //     console.table(activeUsersRolesUsageCount);

  //     return {
  //       statuscode: HttpStatus.OK,
  //       message: "Data fetched successfully",
  //       data: activeUsersRolesUsageCount,
  //     };
  //   } catch (error) {
  //     console.error(
  //       "Error fetching active users roles details:",
  //       error.message,
  //     );
  //     return {
  //       statuscode: HttpStatus.BAD_REQUEST,
  //       message: "Cannot fetch active users roles details!",
  //       data: error,
  //     };
  //   }
  // }

  async getActiveUsersRolesUsageCount(
    getActiveUsersRolesUsageCountDto,
  ): Promise<any> {
    const { customer_id, hdrId } = getActiveUsersRolesUsageCountDto;

    try {
      const db = await cds.connect.to("db");

      let activeUsersRolesUsageCount = await db.run(
        `
    WITH ActiveUsers AS (
      SELECT 
          "BNAME",
          "CLASS",
          "USTYP",
          "ANAME"
      FROM 
          "FF9F2C685CB64B89B27EDD22961BD341"."LO_USR02" 
      WHERE 
          "UFLAG" NOT IN (32, 64, 128)
          AND DAYS_BETWEEN("TRDAT", CURRENT_DATE) < 90
          AND "SYNC_HEADER_ID" = ${hdrId}
          AND "CUSTOMER_ID" = ${customer_id}
  ),
  RolesUsage AS (
      SELECT  
        TRANSACTION_CODE, 
        USER
      FROM 
        "FF9F2C685CB64B89B27EDD22961BD341"."LO_SM20" 
      WHERE 
        TRANSACTION_CODE NOT IN ('S000', 'SESSION_MANAGER')
        AND "SYNC_HEADER_ID" = ${hdrId}
        AND "CUSTOMER_ID" = ${customer_id}
    )
  SELECT 
      AU."BNAME",
      AU."ANAME",
      AU."CLASS",
      AU."USTYP",
      RU."TRANSACTION_CODE",
      COUNT(RU."TRANSACTION_CODE") AS "TRANSACTION_COUNT"
  FROM 
      ActiveUsers AU
  JOIN 
      RolesUsage RU
  ON 
      AU."BNAME" = RU."USER"
  GROUP BY
      AU."BNAME", RU."TRANSACTION_CODE", AU."CLASS", AU."USTYP", AU."ANAME"
  ORDER BY
      AU."BNAME", "TRANSACTION_COUNT" DESC;
    `,
      );

      const transformedResult = activeUsersRolesUsageCount.reduce(
        (acc, curr) => {
          const {
            BNAME,
            ANAME,
            CLASS,
            USTYP,
            TRANSACTION_CODE,
            TRANSACTION_COUNT,
          } = curr;

          // Check if the user already exists in the result
          if (!acc[BNAME]) {
            acc[BNAME] = { BNAME, ANAME, CLASS, USTYP };
          }

          const currentTransactionCount = Object.keys(acc[BNAME]).filter(
            (key) => key.startsWith("TRANSACTION_CODE_"),
          ).length;

          acc[BNAME][`TRANSACTION_CODE_${currentTransactionCount}`] =
            TRANSACTION_CODE;
          acc[BNAME][`TRANSACTION_COUNT_${currentTransactionCount}`] =
            TRANSACTION_COUNT;

          return acc;
        },
        {},
      );

      const resultArray = Object.values(transformedResult);

      console.table(resultArray);

      return {
        statuscode: HttpStatus.OK,
        message: "Data fetched successfully",
        data: resultArray,
      };
    } catch (error) {
      console.error(
        "Error fetching active users roles details:",
        error.message,
      );
      return {
        statuscode: HttpStatus.BAD_REQUEST,
        message: "Cannot fetch active users roles details!",
        data: error,
      };
    }
  }
}
