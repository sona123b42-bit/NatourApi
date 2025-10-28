const stripe = require('../utils/stripe');
const Tour = require('../model/tourModel');
exports.createCheckoutSession = async (req, res, next) => {
  try {
    // 1️⃣ Get the tour the user wants to buy
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) {
      return res.status(404).json({ message: 'No tour found with that ID' });
    }

    // 2️⃣ Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?tour=${req.params.tourId}`,
      cancel_url: `${process.env.FRONTEND_URL}/tour/${req.params.tourId}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                tour.imageCover
                  ? `https://res.cloudinary.com/dkxaoc4qd/image/upload/${tour.imageCover}`
                  : '',
              ],
            },
            unit_amount: tour.price * 100, // 💰 convert from dollars to cents
          },
          quantity: 1,
        },
      ],
    });

    // 3️⃣ Send session to client
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating Stripe session' });
  }
};
