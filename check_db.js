
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.appointment.count();
        console.log(`Connection successful. Current appointment count: ${count}`);
        
        // Check for new column
        const first = await prisma.appointment.findFirst({
            select: { recurrenceId: true }
        });
        console.log(`RecurrenceId column exists? ${first !== undefined}`);
    } catch (e) {
        console.error('Error in minimal check:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
