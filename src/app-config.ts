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
  startDate: "2021-05-20",
  weather: {
    lat: 31.2304,
    lon: 121.4737,
    city: "Shanghai",
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
