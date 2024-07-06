import { LightStatus } from '../database/entities';

export function isUnavailableOrPossiblyUnavailable(
  status: LightStatus,
): status is LightStatus.UNAVAILABLE | LightStatus.POSSIBLY_UNAVAILABLE {
  return status === LightStatus.UNAVAILABLE || status === LightStatus.POSSIBLY_UNAVAILABLE;
}
