import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { ObjectId } from "mongodb";
import { getDatabase } from "../../../../lib/mongodb";

// تابع کمکی برای تبدیل ObjectId به URL
function getImageUrl(imageId: string): string {
  if (!imageId || imageId === 'placeholder') {
    return '/placeholder.jpg';
  }
  
  if (imageId.startsWith('http') || imageId.startsWith('https')) {
    return imageId;
  }
  
  if (imageId.startsWith('/')) {
    return imageId;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/api/files/${imageId}`;
}

// GET - دریافت سبد خرید
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "وارد شوید" },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);

    // دریافت سبد خرید
    const cartItems = await db.collection('CartItem').aggregate([
      {
        $match: { userId }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $lookup: {
          from: 'Product',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          _id: 1,
          quantity: 1,
          createdAt: 1,
          'product._id': 1,
          'product.title': 1,
          'product.price': 1,
          'product.images': 1,
          'product.inStock': 1,
          'product.shippingCost': 1,
          'product.code': 1 // اضافه کردن code
        }
      }
    ]).toArray();

    // تبدیل ObjectIdهای GridFS به URL
    const cartItemsWithUrls = cartItems.map((item: any) => ({
      id: item._id.toString(),
      quantity: item.quantity,
      product: {
        id: item.product._id.toString(),
        title: item.product.title,
        price: item.product.price,
        images: item.product.images && item.product.images.length > 0 
          ? item.product.images.map((img: string) => getImageUrl(img))
          : ['/placeholder.jpg'],
        inStock: item.product.inStock,
        shippingCost: item.product.shippingCost || 0,
        code: item.product.code || '' // اضافه کردن code
      }
    }));

    return NextResponse.json(cartItemsWithUrls);
  } catch (error) {
    console.error("خطا در دریافت سبد خرید:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سبد خرید" },
      { status: 500 }
    );
  }
}

// POST - افزودن محصول به سبد خرید
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "وارد شوید" },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();
    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);
    const productObjectId = new ObjectId(productId);

    // بررسی وجود محصول
    const product = await db.collection('Product').findOne({ 
      _id: productObjectId 
    });

    if (!product) {
      return NextResponse.json(
        { error: "محصول یافت نشد" },
        { status: 404 }
      );
    }

    if (!product.inStock) {
      return NextResponse.json(
        { error: "محصول ناموجود است" },
        { status: 400 }
      );
    }

    // بررسی وجود آیتم در سبد خرید
    const existingCartItem = await db.collection('CartItem').findOne({
      userId,
      productId: productObjectId
    });

    let cartItem;
    
    if (existingCartItem) {
      // آپدیت تعداد
      await db.collection('CartItem').updateOne(
        { _id: existingCartItem._id },
        { $set: { quantity: existingCartItem.quantity + quantity } }
      );
      
      cartItem = {
        ...existingCartItem,
        quantity: existingCartItem.quantity + quantity
      };
    } else {
      // ایجاد آیتم جدید
      const newCartItem = {
        userId,
        productId: productObjectId,
        quantity,
        createdAt: new Date()
      };
      
      const result = await db.collection('CartItem').insertOne(newCartItem);
      cartItem = {
        _id: result.insertedId,
        ...newCartItem
      };
    }

    // گرفتن اطلاعات کامل محصول
    const fullProduct = await db.collection('Product').findOne({ 
      _id: productObjectId 
    }, {
      projection: {
        title: 1,
        price: 1,
        images: 1,
        inStock: 1,
        shippingCost: 1,
        code: 1 // اضافه کردن code
      }
    });

    const cartItemWithUrls = {
      id: cartItem._id.toString(),
      quantity: cartItem.quantity,
      product: {
        id: productObjectId.toString(),
        title: fullProduct?.title || '',
        price: fullProduct?.price || 0,
        images: fullProduct?.images && fullProduct.images.length > 0 
          ? fullProduct.images.map((img: string) => getImageUrl(img))
          : ['/placeholder.jpg'],
        inStock: fullProduct?.inStock || false,
        shippingCost: fullProduct?.shippingCost || 0,
        code: fullProduct?.code || '' // اضافه کردن code
      }
    };
    
    return NextResponse.json(cartItemWithUrls);
  } catch (error) {
    console.error("خطا در افزودن به سبد خرید:", error);
    return NextResponse.json(
      { error: "خطا در افزودن به سبد خرید" },
      { status: 500 }
    );
  }
}

// PUT - آپدیت تعداد محصول در سبد خرید
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "وارد شوید" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "شناسه محصول و تعداد الزامی است" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "تعداد باید حداقل ۱ باشد" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);
    const productObjectId = new ObjectId(productId);

    // بررسی وجود محصول در سبد خرید
    const existingCartItem = await db.collection('CartItem').findOne({
      userId,
      productId: productObjectId
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { error: "محصول در سبد خرید یافت نشد" },
        { status: 404 }
      );
    }

    // بررسی موجودی محصول
    const product = await db.collection('Product').findOne({ 
      _id: productObjectId 
    }, {
      projection: { inStock: 1 }
    });

    if (!product?.inStock && quantity > 0) {
      return NextResponse.json(
        { error: "محصول ناموجود است" },
        { status: 400 }
      );
    }

    // آپدیت تعداد
    await db.collection('CartItem').updateOne(
      { _id: existingCartItem._id },
      { $set: { quantity } }
    );

    // گرفتن اطلاعات کامل
    const updatedCartItem = await db.collection('CartItem').findOne({
      _id: existingCartItem._id
    });

    const fullProduct = await db.collection('Product').findOne({ 
      _id: productObjectId 
    }, {
      projection: {
        title: 1,
        price: 1,
        images: 1,
        inStock: 1,
        shippingCost: 1,
        code: 1 // اضافه کردن code
      }
    });

    const cartItemWithUrls = {
      id: updatedCartItem?._id.toString() || '',
      quantity: updatedCartItem?.quantity || 0,
      product: {
        id: productObjectId.toString(),
        title: fullProduct?.title || '',
        price: fullProduct?.price || 0,
        images: fullProduct?.images && fullProduct.images.length > 0 
          ? fullProduct.images.map((img: string) => getImageUrl(img))
          : ['/placeholder.jpg'],
        inStock: fullProduct?.inStock || false,
        shippingCost: fullProduct?.shippingCost || 0,
        code: fullProduct?.code || '' // اضافه کردن code
      }
    };
    
    return NextResponse.json(cartItemWithUrls);
  } catch (error) {
    console.error("خطا در آپدیت سبد خرید:", error);
    return NextResponse.json(
      { error: "خطا در آپدیت سبد خرید" },
      { status: 500 }
    );
  }
}

// DELETE - حذف محصول از سبد خرید
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "وارد شوید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const userId = new ObjectId(session.user.id);
    const productObjectId = new ObjectId(productId);

    // بررسی وجود محصول در سبد خرید
    const existingCartItem = await db.collection('CartItem').findOne({
      userId,
      productId: productObjectId
    });

    if (!existingCartItem) {
      return NextResponse.json(
        { error: "محصول در سبد خرید یافت نشد" },
        { status: 404 }
      );
    }

    // حذف محصول
    await db.collection('CartItem').deleteOne({
      _id: existingCartItem._id
    });

    return NextResponse.json({ 
      success: true,
      message: "محصول با موفقیت حذف شد" 
    });
  } catch (error) {
    console.error("خطا در حذف از سبد خرید:", error);
    return NextResponse.json(
      { error: "خطا در حذف از سبد خرید" },
      { status: 500 }
    );
  }
}