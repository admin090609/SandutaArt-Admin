import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === 'GET') {
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }));
    } else {
      res.json(await Product.find());
    }
  }

  if (method === 'POST') {
    const { title, description, images, category, properties, options, minWidth, minHeight } = req.body;
    const productDoc = await Product.create({
      title,
      description,
      images,
      category,
      properties,
      options: options || [], // Ensure options is an array even if it's not provided,
      minWidth,
      minHeight
    });
    res.json(productDoc);
  }

  if (method === 'PUT') {
    const { title, description, images, category, properties, _id, options, minWidth, minHeight } = req.body;
    await Product.updateOne({ _id }, {
      title,
      description,
      images,
      category,
      properties,
      options: options || [],
      minWidth,
      minHeight
    });
    res.json(true);
  }


  if (method === 'DELETE') {
    if (req.query?.id) {
      await Product.deleteOne({ _id: req.query?.id });
      res.json(true);
    }
  }
}
