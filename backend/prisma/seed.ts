import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Crear sedes
  const sedeNorte = await prisma.sede.create({
    data: { nombre: 'Sede Norte', direccion: 'Calle 5 No. 8-30', ciudad: 'Popayán' },
  });
  const sedeCentro = await prisma.sede.create({
    data: { nombre: 'Sede Centro', direccion: 'Cra 10 No. 12-15', ciudad: 'Popayán' },
  });

  // Crear medicamentos
  const metformina = await prisma.medicamento.create({
    data: { nombre: 'Metformina', presentacion: '850mg' },
  });
  const amoxicilina = await prisma.medicamento.create({
    data: { nombre: 'Amoxicilina', presentacion: '500mg' },
  });
  const losartan = await prisma.medicamento.create({
    data: { nombre: 'Losartán', presentacion: '50mg' },
  });

  // Crear inventarios
  await prisma.inventario.createMany({
    data: [
      {
        medicamentoId: metformina.id,
        sedeId: sedeNorte.id,
        cantidad: 120,
      },
      {
        medicamentoId: amoxicilina.id,
        sedeId: sedeCentro.id,
        cantidad: 0,
        motivoNoDisp: 'Retraso en la cadena de suministro nacional',
        alternativa: 'Ampicilina 500mg',
      },
      {
        medicamentoId: losartan.id,
        sedeId: sedeCentro.id,
        cantidad: 40,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
