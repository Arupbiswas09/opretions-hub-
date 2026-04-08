import { redisDel, HUB_KEYS } from '../redis';

export function pipelineKpiKey(orgId: string): string {
  return `${HUB_KEYS.kpi}:pipeline:${orgId}`;
}

export function salesKpiKey(orgId: string): string {
  return `${HUB_KEYS.kpi}:sales:${orgId}`;
}

export async function invalidatePipelineKpi(orgId: string): Promise<void> {
  await redisDel(pipelineKpiKey(orgId));
}

export async function invalidateSalesKpi(orgId: string): Promise<void> {
  await redisDel(salesKpiKey(orgId));
}

export async function invalidateAllSalesKpis(orgId: string): Promise<void> {
  await Promise.all([invalidatePipelineKpi(orgId), invalidateSalesKpi(orgId)]);
}
