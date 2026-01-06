export interface AppConfig {
  timezone: string;
  startDate: string;
  weather: {
    lat: number;
    lon: number;
    city?: string;
  };
  qwen: {
    model: string;
    baseUrl: string;
  };
  email: {
    from: string;
    to: string[];
    subject: string;
  };
}

export const appConfig: AppConfig = {
  timezone: "Asia/Shanghai",
  startDate: "2022-04-13",
  weather: {
    lat: 26.0745,
    lon: 119.2965,
    city: "福州",
  },
  qwen: {
    model: "qwen-plus",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  email: {
    from: "xiaolin <hi@xiaolinbenben.com>",
    to: ["3370942916@qq.com"],
    subject: "Good morning",
  },
};
