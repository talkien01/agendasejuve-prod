require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function testRecurrence() {
  console.log('--- Testing Recurrence Logic ---');
  
  // 1. Simulate the data that would be sent via POST /api/appointments
  const testData = {
    date: '2026-04-06', // A Monday
    startTime: '10:00',
    endTime: '11:00',
    type: 'Cita',
    status: 'PENDIENTE',
    notes: 'Test recurring series',
    patientId: null, // We'll find a patient
    isRecurring: true,
    recurrenceCount: 3
  };

  try {
    const patient = await prisma.patient.findFirst();
    if (!patient) {
      console.log('No patient found to test with.');
      return;
    }
    testData.patientId = patient.id;

    console.log(`Starting creation of ${testData.recurrenceCount} appointments for patient: ${patient.name}`);

    const [y, m, d] = testData.date.split('-').map(Number);
    const recurrenceId = crypto.randomUUID();
    
    for (let i = 0; i < testData.recurrenceCount; i++) {
        const instanceDate = new Date(y, m - 1, d + (i * 7), 0, 0, 0);
        const app = await prisma.appointment.create({
            data: {
                date: instanceDate,
                startTime: testData.startTime,
                endTime: testData.endTime,
                type: testData.type,
                status: testData.status,
                notes: testData.notes,
                patientId: testData.patientId,
                recurrenceId: recurrenceId
            }
        });
        console.log(`Created instance ${i+1}: ${app.date.toISOString().split('T')[0]}`);
    }

    // Verify
    const count = await prisma.appointment.count({ where: { recurrenceId } });
    console.log(`Verification: Found ${count} appointments with recurrenceId ${recurrenceId}`);
    
    if (count === 3) {
        console.log('✅ RECURRENCE TEST PASSED');
    } else {
        console.log('❌ RECURRENCE TEST FAILED');
    }

    // Cleanup
    await prisma.appointment.deleteMany({ where: { recurrenceId } });
    console.log('Cleanup: Deleted test appointments.');

  } catch (err) {
    console.error('Test Error:', err);
  }
}

async function testAttachments() {
    console.log('\n--- Testing Clinical Records & Attachments ---');
    try {
        const patient = await prisma.patient.findFirst();
        if (!patient) return;

        const record = await prisma.clinicalRecord.create({
            data: {
                patientId: patient.id,
                content: 'Test content with attachment',
                diagnosis: 'Test Diagnosis',
                date: new Date()
            }
        });
        console.log(`Created record: ${record.id}`);

        const attachment = await prisma.recordAttachment.create({
            data: {
                name: 'test_doc.pdf',
                url: '/uploads/clinical-records/test/test_doc.pdf',
                type: 'application/pdf',
                size: 1024,
                clinicalRecordId: record.id
            }
        });
        console.log(`Created attachment: ${attachment.name}`);

        // Verify with join
        const verifiedRecord = await prisma.clinicalRecord.findUnique({
            where: { id: record.id },
            include: { attachments: true }
        });

        if (verifiedRecord.attachments.length === 1 && verifiedRecord.attachments[0].name === 'test_doc.pdf') {
            console.log('✅ ATTACHMENTS DB TEST PASSED');
        } else {
            console.log('❌ ATTACHMENTS DB TEST FAILED');
        }

        // Cleanup
        await prisma.recordAttachment.deleteMany({ where: { clinicalRecordId: record.id } });
        await prisma.clinicalRecord.delete({ where: { id: record.id } });
        console.log('Cleanup: Deleted test record and attachment.');

    } catch (err) {
        console.error('Attachment Test Error:', err);
    }
}

async function run() {
    await testRecurrence();
    await testAttachments();
    await prisma.$disconnect();
}

run();
