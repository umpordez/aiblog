import { fileURLToPath } from "url";
import path from 'node:path';

export default path.dirname(fileURLToPath(import.meta.url));