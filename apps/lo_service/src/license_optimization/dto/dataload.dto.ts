// import { Type } from "class-transformer";
// import { IsArray } from "class-validator";

export class USR02_Dto {
  BNAME: string | null; //STRING
  GLTGV: string | null; //DATE
  GLTGB: string | null; //DATE
  USTYP: string | null; //string
  CLASS: string | null; //string
  UFLAG: string | null; //number
  ACCNT: string | null; //string
  ANAME: string | null; //string
  ERDAT: string | null; //date
  TRDAT: string | null; //date
  LTIME: string | null; //time
  TZONE: string | null; //STRING
}

export class AGR_USERS_Dto {
  AGR_NAME: string | null; //STRING
  UNAME: string | null; //STRING
  FROM_DAT: string | null; //DATE
  TO_DAT: string | null; //DATE
}

export class SM20_Dto {
  DATE: string | null; //DATE;
  TIME: string | null; //TIME;
  USER: string | null; //STRING;
  TERMINAL_NAME: string | null; //STRING;
  TRANSACTION_CODE: string | null; //STRING;
  PROGRAM: string | null; //STRING;
  MESSAGE_TEXT: string | null; //STRING;
}

export class AGR_1251_Dto {
  AGR_NAME: string | null; //STRING;
  OBJECT: string | null; //STRING;
  AUTH: string | null; //STRING;
  FIELD: string | null; //STRING;
  LOW: string | null; //STRING;
  HIGH: string | null; //STRING;
}
