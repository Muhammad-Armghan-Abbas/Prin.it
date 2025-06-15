import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      try {
        const product = await prisma.product.update({
          where: { id: String(id) },
          data: req.body,
        });
        res.status(200).json(product);
      } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
      }
      break;

    case 'DELETE':
      try {
        await prisma.product.delete({
          where: { id: String(id) },
        });
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
