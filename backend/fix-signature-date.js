import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Fix signedAt date for the latest application submitted on 22.12.2025
 * Changes signedAt from 10.12.2025 to 09.12.2025
 */
async function fixSignatureDate() {
  try {
    console.log('Looking for application submitted on 2025-12-22...');
    
    // Find applications created on 2025-12-22
    // Note: dates in DB are stored in UTC, so we need to account for timezone
    const targetDate = new Date('2025-12-22');
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date('2025-12-23');
    nextDay.setHours(0, 0, 0, 0);
    
    // Get the latest application from that date
    const applications = await prisma.driverApplication.findMany({
      where: {
        createdAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
      include: {
        legalConsents: true,
      },
    });
    
    if (applications.length === 0) {
      console.log('No application found submitted on 2025-12-22');
      // Try to find the most recent application
      const latestApp = await prisma.driverApplication.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          legalConsents: true,
        },
      });
      
      if (!latestApp) {
        console.log('No applications found in database');
        return;
      }
      
      console.log(`Found latest application: ID=${latestApp.id}, createdAt=${latestApp.createdAt}`);
      console.log(`Legal consents: ${latestApp.legalConsents.length}`);
      
      // Update signedAt dates from 2025-12-10 to 2025-12-09
      const oldDate = new Date('2025-12-10');
      oldDate.setHours(0, 0, 0, 0);
      const newDate = new Date('2025-12-09');
      newDate.setHours(0, 0, 0, 0);
      
      for (const consent of latestApp.legalConsents) {
        if (consent.signedAt) {
          const consentDate = new Date(consent.signedAt);
          consentDate.setHours(0, 0, 0, 0);
          
          // Check if the date matches 2025-12-10
          if (consentDate.getTime() === oldDate.getTime()) {
            console.log(`Updating consent ${consent.id} (${consent.type}) from ${consent.signedAt} to ${newDate.toISOString()}`);
            
            await prisma.legalConsent.update({
              where: { id: consent.id },
              data: { signedAt: newDate },
            });
            
            console.log(`✓ Updated consent ${consent.id}`);
          }
        }
      }
      
      console.log('Done!');
      return;
    }
    
    const application = applications[0];
    console.log(`Found application: ID=${application.id}, createdAt=${application.createdAt}`);
    console.log(`Legal consents: ${application.legalConsents.length}`);
    
    // Update signedAt dates from 2025-12-10 to 2025-12-09
    const oldDate = new Date('2025-12-10');
    oldDate.setHours(0, 0, 0, 0);
    const newDate = new Date('2025-12-09');
    newDate.setHours(0, 0, 0, 0);
    
    let updatedCount = 0;
    
    for (const consent of application.legalConsents) {
      if (consent.signedAt) {
        const consentDate = new Date(consent.signedAt);
        consentDate.setHours(0, 0, 0, 0);
        
        // Check if the date matches 2025-12-10 (or close to it, accounting for timezone)
        const dateDiff = Math.abs(consentDate.getTime() - oldDate.getTime());
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (dateDiff < oneDay && consentDate.getDate() === 10 && consentDate.getMonth() === 11) {
          console.log(`Updating consent ${consent.id} (${consent.type}) from ${consent.signedAt} to ${newDate.toISOString()}`);
          
          await prisma.legalConsent.update({
            where: { id: consent.id },
            data: { signedAt: newDate },
          });
          
          updatedCount++;
          console.log(`✓ Updated consent ${consent.id}`);
        }
      }
    }
    
    if (updatedCount === 0) {
      console.log('No consents found with signedAt = 2025-12-10');
    } else {
      console.log(`\n✓ Successfully updated ${updatedCount} consent(s)`);
    }
    
  } catch (error) {
    console.error('Error fixing signature date:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixSignatureDate()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

