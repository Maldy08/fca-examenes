import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando lista blanca de docentes...")

  // 👇 LISTA DE PROFESORES AUTORIZADOS
  // Agrega aquí los correos de tus colegas
  const authorizedTeachers = [
    { email: 'carlos.maldonado.verdin@uabc.edu.mx', name: 'Profe. Carlos Maldonado' }, // <--- PON TU CORREO REAL AQUÍ
    { email: 'camv29@gmail.com', name: 'Profe. Invitado' },
  ];

  for (const teacher of authorizedTeachers) {
    const user = await prisma.user.upsert({
      where: { email: teacher.email },
      update: { 
        role: 'ADMIN', // Aseguramos que sea admin si ya existía
        name: teacher.name // Actualizamos nombre si cambió
      },
      create: {
        email: teacher.email,
        name: teacher.name,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Acceso concedido a: ${user.email}`);
  }

  console.log("🔒 Sistema de seguridad actualizado.");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })