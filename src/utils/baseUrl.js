let baseUrlPrefix = "";
const env = process.env.NODE_ENV;
switch (env) {
  case "development":
    baseUrlPrefix = "https://mattmsun.xyz:3000";
    // baseUrlPrefix = "http://localhost:8000";

    break;
  case "production":
    baseUrlPrefix = "https://www.mattmsun.xyz";
    break;
}
export const baseUrl = baseUrlPrefix;
