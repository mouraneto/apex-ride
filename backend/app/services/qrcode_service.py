import qrcode
import io
import base64


def generate_rental_qr_code_base64(rental_uuid: str) -> str:
    """
    Gera uma imagem de QR Code codificada em Base64 contendo EXCLUSIVAMENTE o UUID da reserva.
    Nenhum dado pessoal do piloto é inserido no payload do QR Code por motivos de privacidade/LGPD.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(rental_uuid)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_str}"
