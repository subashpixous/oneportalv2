export interface AadharGetOtpModel {

  AUAKUAParameters: {
    LAT: string;
    LONG: string;
    DEVMACID: string;
    DEVID: string;
    CONSENT: string;
    SHRC: string;
    VER: string;
    SERTYPE: string;
    ENV: string;
    CH: string;
    AADHAARID: string;
    SLK: string;
    RRN: string;
    REF: string;
  };

  PIDXML: string;

  ENVIRONMENT: string;

}


export interface AadharverifyOtpModel {

  AUAKUAParameters: {
    LAT: string;
    LONG: string;
    DEVMACID: string;
    DEVID: string;
    CONSENT: string;
    SHRC: string;
    VER: string;
    SERTYPE: string;
    ENV: string;
    AADHAARID: string;
    SLK: string;
    RRN: string;
    REF: string;
    TXN:string;
    OTP :string;     
    LANG :string;  
    PFR :string;  
  };

  PIDXML: string;

  ENVIRONMENT: string;

}