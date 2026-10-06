import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'tradger.db';

// enableChangeListener: 데이터가 바뀌면 useLiveQuery로 구독한 화면이 자동 갱신된다.
const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });
