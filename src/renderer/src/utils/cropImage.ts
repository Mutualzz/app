import type { Area } from "react-easy-crop";

export const cropImage = async (
    imageSrc: string,
    file: File,
    croppedAreaPixels: Area,
    rotation = 0,
    flip = false,
): Promise<File> => {
    // Only crop static images, since Canvas clamps gifs to one animation (we handle gifs on server side)
    if (file.type === "image/gif") return file;

    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (rotation) ctx.rotate((rotation * Math.PI) / 180);
    if (flip) ctx.scale(-1, 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height,
    );
    ctx.restore();

    return new Promise((resolve, reject) =>
        canvas.toBlob(
            (blob) =>
                blob
                    ? resolve(
                          new File([blob], file.name, { type: "image/png" }),
                      )
                    : reject(new Error("Canvas is empty")),
            "image/png",
        ),
    );
};
