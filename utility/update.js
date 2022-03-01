async function updateDocument(dbModel, searchParams, infosToUpdate) {
  const result = await dbModel.findOneAndUpdate(
    searchParams,
    { ...infosToUpdate },
    { new: true, runValidators: true }
  );

  return result;
}

module.exports = updateDocument;
