async function createOfficialReferee(data) {
  try {
    // Check if a record with the same idPassportNo already exists
    const existingRecord = await prisma.officialReferee.findUnique({
      where: { idPassportNo: data.idPassportNo },
    });

    if (existingRecord) {
      throw new Error('A record with this ID or Passport Number already exists.');
    }

    return await prisma.officialReferee.create({
      data: data,
    });
  } catch (error) {
    if (error.code === 'P2002' && error.meta.target === 'OfficialReferee_idPassportNo_key') {
      throw new Error('A record with this ID or Passport Number already exists.');
    }
    throw error; // Re-throw other errors
  }
} 