#!/bin/bash

echo "🚀 Aplicando migraciones de base de datos en producción..."
echo ""
echo "⚠️  IMPORTANTE: Este script aplicará las migraciones en la base de datos de producción."
echo "   Asegúrate de tener configurada la variable DATABASE_URL correctamente."
echo ""

# Aplicar migraciones
npx prisma migrate deploy

echo ""
echo "✅ Migraciones aplicadas exitosamente"
echo ""
echo "📊 Generando cliente de Prisma..."
npx prisma generate

echo ""
echo "🎉 ¡Listo! La base de datos está optimizada con los nuevos índices."
