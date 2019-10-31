import dotenv from 'dotenv';
import { startAPI } from '.';

dotenv.config({
  path: '../../.env'
});

startAPI();