import 'reflect-metadata';
import { AppDataSource } from '../src/data-source';
import * as fs from 'fs';

function escapeName(name: string) {
  return name.replace(/\W/g, '_');
}

function relationArrow(relationType: string) {
  switch (relationType) {
    case 'one-to-one':
      return ' "1" -- "1" ';
    case 'one-to-many':
      return ' "1" -- "*" ';
    case 'many-to-one':
      return ' "*" -- "1" ';
    case 'many-to-many':
      return ' "*" -- "*" ';
    default:
      return ' -- ';
  }
}

async function main() {
  const dataSource = await AppDataSource.initialize();
  try {
    const metas = dataSource.entityMetadatas;
    let mermaid = 'classDiagram\n\n';

    // Emit classes with fields
    for (const meta of metas) {
      const className = escapeName(meta.name || meta.tableName);
      mermaid += `class ${className} {\n`;
      for (const col of meta.columns) {
        mermaid += `  ${col.propertyName} : ${col.type}\n`;
      }
      mermaid += `}\n\n`;
    }

    // Emit relations
    for (const meta of metas) {
      const src = escapeName(meta.name || meta.tableName);
      for (const rel of meta.relations) {
        const target = escapeName(rel.inverseEntityMetadata.name || rel.inverseEntityMetadata.tableName);
        const arrow = relationArrow(rel.relationType);
        mermaid += `${src}${arrow}${target}\n`;
      }
    }

    fs.writeFileSync('erd.mmd', mermaid, { encoding: 'utf8' });
    console.log('ERD generado en erd.mmd');
  } catch (err) {
    console.error('Error generando ERD:', err);
  } finally {
    await dataSource.destroy();
  }
}

main();
