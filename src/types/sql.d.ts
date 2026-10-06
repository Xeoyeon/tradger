// Drizzle 마이그레이션(.sql)은 babel inline-import로 문자열이 된다.
declare module '*.sql' {
  const content: string;
  export default content;
}
