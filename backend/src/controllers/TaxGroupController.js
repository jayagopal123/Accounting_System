import catchAsync from "../utils/catchAsync.js";
import taxGroupService from "../services/TaxGroupService.js";

class TaxGroupController {
  createTaxGroup = catchAsync(async (req, res) => {
    const group = await taxGroupService.createTaxGroup({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: "Tax group created", data: group });
  });

  getTaxGroups = catchAsync(async (req, res) => {
    const groups = await taxGroupService.getTaxGroups();
    res.json({ success: true, data: groups });
  });

  getActiveTaxGroups = catchAsync(async (req, res) => {
    const groups = await taxGroupService.getActiveTaxGroups();
    res.json({ success: true, data: groups });
  });

  getTaxGroupById = catchAsync(async (req, res) => {
    const group = await taxGroupService.getTaxGroupById(req.params.id);
    res.json({ success: true, data: group });
  });

  updateTaxGroup = catchAsync(async (req, res) => {
    const group = await taxGroupService.updateTaxGroup(req.params.id, {
      ...req.body,
      updatedBy: req.user._id,
    });
    res.json({ success: true, message: "Tax group updated", data: group });
  });

  calculateTax = catchAsync(async (req, res) => {
    const { groupId, subtotal } = req.body;
    if (!groupId || subtotal === undefined) {
      return res.status(400).json({ success: false, message: "groupId and subtotal are required" });
    }
    const result = await taxGroupService.calculateTax(groupId, subtotal);
    res.json({ success: true, data: result });
  });
}

export default new TaxGroupController();
