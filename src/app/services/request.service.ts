import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Welcome, User, ProductAllData, ProductSold, Warehouse } from '../models/response.interface';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(public http: HttpClient) { }

  public getUsers(url: string): Observable<User[]> {
    return this.http.get<User[]>(url);
  }

  public deleteUser(url: string): Observable<any> {
    return this.http.delete<any>(url); 
  }

  public createUser(url: string, usuario: User): Observable<User> {
    return this.http.post<User>(url, usuario);
  }

  public loginUser(url: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(url, { email, password });
  }

  public editUserVisitStatus(url: string, newVisitStatus: User): Observable<any> {
    return this.http.patch<any>(url, newVisitStatus);
  }

  public createWarehouse(url: string, warehouseData: Warehouse): Observable<any> {
    return this.http.post<any>(url, warehouseData);
  }

  public takeWarehouse(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  public deleteWarehouse(url: string): Observable<any> {
    return this.http.delete<any>(url); 
  }

  public insertProductsInWarehouse(url: string, productData: ProductAllData): Observable<any> {
    return this.http.post<any>(url, productData);
  }

  public takeProducts(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  public deleteProduct(url: string): Observable<any> {
    return this.http.delete<any>(url);
  }

  public editProduct(url: string, productData: ProductAllData): Observable<any> {
    return this.http.put<any>(url, productData);
  }

  public getProductSold(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  public moveProductsToSold(url: string, soldProducts: ProductSold): Observable<any> {
    return this.http.post<any>(url, soldProducts);
  }
  
//API
private apiUrl = 'https://api.deepseek.com/v1/chat/completions';  
private apiKey = 'sk-5d63c70259c44663a0b30b554d62c2bd';  

generateNotification(prompt: string, ignoreNotifications: string): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`
  });

  const body = {
    model: 'deepseek-chat',
    messages: [
      { 
        role: 'system', 
        content: 
        `
        Eres un asistente de notificaciones, tu trabajo es mediante los datos obtenidos enviar las notificaciones necesarias
        considerando con tu criterio si es necesario enviar la notificacion.

        Es imperativo que siempre hagas estas dos cosas: cada notificacion separada por un !, nunca repetir notificaciones ya realizadas y no intentar generar notificaciones siempre, cuando no hay nada que notificar se devuelve "Sin notificacoines", aunque esto no quita que si hay algo inisual comentarlo, a no ser que la notificacion a ignorar ya lo diga

        Tienes que separar las notificaciones por ! cada notificacion diferente tendra uno de estos 

        CRITERIO DE NOTIFICACIONES:
        - Bajo Stock de un producto, tu consideraras si ese producto tiene un bajo stock, peor si esta por dejabo de 5 siempre tienes que notificar 
        - Entrada de nuevos productos, pero solo cuando la entrada sea mayor a 10 
        - Posibles errores, como pueden ser datos que no coinciden con el producto como el precio de ciertos tipos de productos, dimensiones(pero solo si es demasiado evidente una equivocacion)..., 
        - Puedes añadir cualquier criterio que consideres y notificar bajo tu criterio
        - Revision a fondo de todos los datos de todos los productos, cuanquier campo que descuadre hay que notificarlo

        INSTRUCCIONES DE LAS RESPUESTAS: 
          1. Usa un lenguaje claro y directo, sin adornos innecesarios y sin respuestas demasiado largas.  
          2. No utilices listas, símbolos especiales ni negritas.  
          3. Las respuestas tienen que ser cortas y directas, intentando en la mayoria de los casos no pasar de 30 lineas 
          4. Tus respuestas tienen que tener unicamente el cuerpo de la notificacion, nada mas, no comentes nada que no tenga que ver con la notificacion en si
          5. Aunque las tablas de los productos esten en ingles si tienes que nombrar el nombre de alguna tabla traducelo al español 
          6. No es necesario que siempre haya una notificacion, cuando lo unico que se pueda notificar sean las notificaciones ya realizadas simplemente devuelve el mensaje de "Sin notificacoines"
       ` 
      },
      { role: 'user', content: `Notificaciones ya realizadas: ${ignoreNotifications}\n\nProductos en stock:\n${prompt}` }
    ],  
    max_tokens: 150,
    temperature: 0.3   
  };

  return this.http.post<any>(this.apiUrl, body, { headers });
}

    sendMessage(prompt: string, products: string): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      });
    
      const body = {
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 
            `
            Eres el asistente de StockMaster, una aplicación de gestión de almacenes y tiendas.  
            Tu objetivo es proporcionar respuestas claras y bien estructuradas sobre StockMaster.  
            
            FUNCIONES PRINCIPALES DE STOCKMASTER:  
            - Generación de gráficos con datos de inventario.  
            - Escaneo de productos mediante código de barras para gestionar entradas y salidas.  
            - Gestión de múltiples almacenes.  
            - Asistencia sobre el uso de la aplicación.  
            - Panel de notificaciones donde aparecen cosas de interes
            
            INSTRUCCIONES DE RESPUESTA:
            1. No te inventes cosas, si un usuario pregunta algo sobre la aplicacion y no esta descrito como funciona comentale al usuario que no sabes como se hace
            2. Usa un lenguaje claro y directo, sin adornos innecesarios y sin respuestas demasiado largas.  
            3. No utilices listas, símbolos especiales ni negritas.  
            4. No respondas preguntas que no estén relacionadas con StockMaster. En esos casos, di: "Lo siento, solo respondo preguntas sobre StockMaster".
            5. Si el mensaje lleva la palaba "StockMaster" o "stockmaster" o "Stockmaster" nunca puedes contestar que solo respondes preguntas sobre el funcionamiento stockmaster.
            6. Las respuestas tienen que ser cortas y directas, intentando en la mayoria de los casos no pasar de 60 lineas 

            INSTRUCCIONES DE RESPUESTA INTERACTIVA:
            - Tienes los tokens limitados a 150, no puedes hacer uso de mas tokens, tendras que contestar la pregunta unicamente con esos tokens, muy importante que te ajustes a los toquens que tieness y la contestes entrera, no la puedes dejar a medias
            - Se te pasa la pregunta y todos los productos, contesta las preguntas respecto a estos 
            - Los datos que se te pasan son los de los productos de la base de datos, tienes acceso a todos ellos y mediate esa informacion puedes contestar a cualquier pregunta del usuairo
            - El usuario piensa que tienes accesa a muchos datos, si alguno no esta a tu alzance diselo y no te inventes informacion
            - Una de tus principales funciones es dar datos sobre los productos que se te pasan, si el mensaje tiene la palabra "Producto" contesta siempre
            - Da igual que tipo de productos guarde el usuario, si te pide informacion se la tienes que dar

            PAGINAS DE LA WEB: Estas son las paginas de la web, si el usuario se refiere a ellas de otra forma corrigele, al nombrar las paginas elige uno de los dos nombres nombrados
            - Login, pagina de inicio de sesion
            - Registro, pagina para registrarse
            - Inicio/Home, pagina principal donde puedes encontrar dos graficos, puedes añadir y eliminar productos mediante el lector de QR y hacerlo a mano, puedes ver tus almacenes, crearlos y lo mismo con los productos 
            - Almacen, pagina donde se pueden ver todos los almacenes y crear almacenes nuevos, desde esta pagina se accede a los productos de los distintos almacenes
            - Productos/Stock solo se puede acceder desde el almacen que contenga estos productos, una tabla que muestra todos los productos permitiendo filtros y paginacion
            - Graficos, pagina donde se ven graficos que representan diferentes aspectos como ventas de esta semana, entrada y salisa de producos... se pueden personalizar los graficos que queremos ver
            - ChatIA/Chat con la ia, pagina donde se puede hablar con la IA y que esta te ayude con dudas sobre tus productos o a manejar la pagina
            - Paginas generales:
                - Notificaciones, pagina accesible desde toda la web ya que es un desplegable, salen las notificaciones sobre diferentes temas, como pueden ser los productos
                - Footer, en todas las paginas, cuenta con tres imagenes, contacto, © y el logo que son tres cubos rojos y blancos
                - Perfil/Usuario, esta pagina te da las siguientes opciones Cambiar foto de perfil Cambiar nombre Cambiar contraseña Información de la cuenta Cerrar sesion Eliminar cuenta

            **Descripcin general de la aplicacion:**
            StockMaster es una pagina web que se centra ne la gestión de inventario, la aplicación tendrá las siguientes características

            - Generación de gráficos de datos, con la posibilidad de que cada empresa lo personalize a su gusto 
            - Escaner de código de barras, que permitirá llevar un control del stock de los productos, así como proporcionar los datos para los diagramas 
            - Historial de movimientos total de los productos del almacén
            - Calculo automatico de ganancias basándoselas en la venta de los productos del almacén 

            El usuario podrá gestionar todas sus tiendas/almacenes. Se usara una IA para facilitar datos a los usuarios, de forma que si por ejemplo quieren saber el 
            producto mas vendido o el que tiene falta de stock le podrá proporcionar la información 
           ` 
          },
          { role: 'user', content: `Pregunta del usuario: ${prompt}\n\nProductos en stock:\n${products}` }
          ],
        max_tokens: 150,
        temperature: 0.3   
      };

      return this.http.post<any>(this.apiUrl, body, { headers });
    }

    getLocationCoordinates(city: any, street: any, comunity: any): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      });
    
      const body = {
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 
            `
            Eres un sistema de traduccion de calles a coordenadas, tu trabajo es sacar la latitud y longitud de las ubicaciones que te pasen
            ES MUY IMPORTANTE DE QUE NO AÑADAS NADA MAS AL MENAJE QUE LA LATITUD Y LONGITUD YA QUE POSTERIORMENTE SE PROCESARAN LOS DATOS Y SI AÑADES INFORMACION DARA ERROR

            NORMAS:
              - Solo puedes devolver una cosa latitud y longitud, tienen que ser exactas de las calles solicitadas y si especifican el numero mas exactas aun
              - No se especifica el pais por que se da por hehco que es españa
              - Dado que tus respuestas no son precisas consultaras la calle en aplicaciones como google maps
           ` 
          },
          { role: 'user', content: ` Comunidad Autonoma:${comunity},  Ciudad: ${city}, Calle: ${street}` }
        ],  
        max_tokens: 50,
        temperature: 0.3   
      };
    
      return this.http.post<any>(this.apiUrl, body, { headers });
    }

    createGraphics(pronpt: string, products: any): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      });
    
      const body = {
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 
            `
           Eres un sistema de generación de gráficos que trabaja exclusivamente con la librería Chart.js. Tu función es construir los datos necesarios para que otro sistema genere un gráfico a partir de los datos que se te proporcionen.

          ⚠️ NUNCA debes inventar datos. Solo puedes trabajar con la información que se te haya entregado previamente. Si no hay suficientes datos, simplemente no generes nada.

          📌 EJEMPLO DE CÓMO SE USAN TUS DATOS (NO LO DEBES DEVOLVER, ES SOLO REFERENCIA):
            public discountsApplied = {
              labels: ['Enero', 'Febrero', 'Marzo'],
              datasets: [{
                label: 'Descuentos aplicados',
                data: [200, 250, 300],
              }]
            };

          📤 DATOS QUE DEBES DEVOLVER (IMPORTANTE):
          Tu salida **solo debe contener tres bloques de texto**, **en este orden** y **separados por ! (sin espacios alrededor del signo de exclamación)**:

          1. **labels** → palabras separadas por espacio (sin comas, corchetes ni otros símbolos)
          2. **label** → una corta descripción (con solo la primera letra en mayúscula)
          3. **data** → números separados por espacio, en el mismo orden que los labels

          ✅ EJEMPLO DE SALIDA CORRECTA:
          Agua CocaCola Vino!Consumo por tipo de bebida!150 200 175

          ---

          📏 REGLAS DE FORMATO (OBLIGATORIO SEGUIRLAS):
          - La salida debe tener exactamente **dos ! como separadores** entre las tres partes.
          - **NO incluyas nombres de secciones como "labels", "label" o "data"** en la respuesta. Solo escribe los datos.
          - No uses comas, puntos, corchetes, saltos de línea ni ningún carácter especial.
          - Todo debe estar en una única línea de texto.
          - Cada label tiene que tener su data, no saques los datos del label sin sacar su data correspondiente
          - Los labels deben tener al menos 3 elementos.
          - Usa solo los datos que se te hayan proporcionado. No generes ni asumas datos.
          - La palabra del label (la descripción del gráfico) debe ser **clara, concisa, y en minúscula salvo la primera letra**.

          🚫 NUNCA devuelvas explicaciones, texto adicional, comentarios ni formatos tipo JSON. SOLO la línea de datos separada con !.

           ` 
          },
          { role: 'user', content: `Peticion del usuario:${pronpt}, datos sobre los que generar graficos: ${products}` }
        ],  
        max_tokens: 50,
        temperature: 0.3   
      };
    
      return this.http.post<any>(this.apiUrl, body, { headers });
    }

}
