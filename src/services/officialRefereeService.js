async function createOfficialReferee(data) {
  try {
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