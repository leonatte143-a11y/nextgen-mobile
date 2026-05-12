/**
 * End-user profile as returned by the API (same shape as GET/PUT `/api/v1/users/me`,
 * auth OTP verify, and register — see backend `serializers/mappers.js` `toMockUser`).
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  rewardPoints: number;
  referralCode: string;
}

/** Fields accepted by PUT `/api/v1/users/me` (subset of columns). */
export type UserProfileUpdate = Partial<
  Pick<User, 'firstName' | 'lastName' | 'email' | 'address' | 'phone' | 'rewardPoints' | 'referralCode'>
>;

/** POST `/api/v1/auth/register` body (phone required). */
export type UserRegistrationInput = UserProfileUpdate & {
  phone: string;
};

/** Normalize API / Sequelize payloads so UI always gets defined strings. */
export function coerceUser(raw: unknown): User {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    id: String(o.id ?? ''),
    firstName: String(o.firstName ?? ''),
    lastName: String(o.lastName ?? ''),
    email: String(o.email ?? ''),
    phone: String(o.phone ?? ''),
    address: String(o.address ?? ''),
    rewardPoints: Number.isFinite(Number(o.rewardPoints)) ? Number(o.rewardPoints) : 0,
    referralCode: String(o.referralCode ?? ''),
  };
}
