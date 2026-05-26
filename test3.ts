import { authApi, classApi } from './apps/web/src/lib/api';

async function test() {
  try {
    const loginRes = await authApi.login('guru@adaptivemath.id', 'guru123456');
    // We need to set the token manually for api.ts if we run this in node.
    // However, api.ts uses localStorage which doesn't exist in Node.
  } catch (err) {
    console.error(err);
  }
}
