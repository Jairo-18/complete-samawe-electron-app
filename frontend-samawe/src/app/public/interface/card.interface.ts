export interface DashboardCard {
  icon?: string;
  title?: string;
  description?: string;
  route?: string;
  queryParams?: { [key: string]: any };
  iconNext?: string;
  allowedRoles?: string[];
}
