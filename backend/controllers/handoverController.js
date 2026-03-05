const Handover = require("../models/Handover");

exports.createHandover = async (req, res) => {

 try {

  const handover = new Handover({
   ...req.body,
   createdBy: req.user.id
  });

  await handover.save();

  res.json(handover);

 } catch (error) {

  res.status(500).json(error.message);

 }

};

exports.getHandovers = async (req, res) => {

 try {

  const handovers = await Handover
   .find()
   .populate("patientId")
   .populate("createdBy", "name role");

  res.json(handovers);

 } catch (error) {

  res.status(500).json(error.message);

 }

};

exports.reviewHandover = async (req, res) => {

 try {

  const handover = await Handover.findById(req.params.id);

  if (!handover) {
   return res.status(404).json("Handover not found");
  }

  handover.isReviewed = true;
  handover.reviewedBy = req.user.id;

  await handover.save();

  res.json("Handover reviewed");

 } catch (error) {

  res.status(500).json(error.message);

 }

};