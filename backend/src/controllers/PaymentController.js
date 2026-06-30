import paymentService from "../services/PaymentService.js";
import catchAsync from "../utils/catchAsync.js";

class PaymentController {
  createPayment = catchAsync(async (req, res) => {
    const payment = await paymentService.createPayment({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully.",
      data: payment,
    });
  });

  getPayments = catchAsync(async (req, res) => {
    const payments = await paymentService.getPayments();

    res.status(200).json({
      success: true,
      data: payments,
    });
  });

  getPaymentById = catchAsync(async (req, res) => {
    const payment = await paymentService.getPaymentById(req.params.id);

    res.status(200).json({
      success: true,
      data: payment,
    });
  });

  submitPayment = catchAsync(async (req, res) => {
    const payment = await paymentService.submitPayment(req.params.id);

    res.status(200).json({
      success: true,
      message: "Payment submitted and journal entry created.",
      data: payment,
    });
  });

  cancelPayment = catchAsync(async (req, res) => {
    const payment = await paymentService.cancelPayment(req.params.id);

    res.status(200).json({
      success: true,
      message: "Payment cancelled.",
      data: payment,
    });
  });
}

export default new PaymentController();
