import { defineConfig } from 'sanity';
import { schemaTypes } from './sanity/schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'Leon Grosso · Web Personal',

  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'demo',
  dataset: process.env.PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',

  plugins: [],

  schema: {
    types: schemaTypes,
  },
});
