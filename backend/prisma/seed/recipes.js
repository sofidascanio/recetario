export async function seedRecipes(prisma, { users, ingredients, meals }) {
    const recipes = [
        // PIZZA MARGHERITA — autor: chef
        {
            title: 'Pizza Margherita Clásica',
            description: 'La pizza más simple y deliciosa. Masa casera, salsa de tomate y mozzarella fresca.',
            difficulty: 'MEDIUM',
            prepTimeMinutes: 90,
            cookTimeMinutes: 15,
            servings: 4,
            tags: ['italiana', 'vegetariana', 'clásica'],
            authorId: users.chef.id,
            mealId: meals.pizza.id,
            ingredients: {
                create: [
                    { ingredientId: ingredients.harina000.id,    quantity: 500,  unit: 'GRAM',       order: 1 },
                    { ingredientId: ingredients.levaduraSeca.id, quantity: 7,    unit: 'GRAM',       order: 2 },
                    { ingredientId: ingredients.sal.id,          quantity: 1,    unit: 'TEASPOON',   order: 3, notes: 'al gusto' },
                    { ingredientId: ingredients.aceiteOliva.id,  quantity: 2,    unit: 'TABLESPOON', order: 4 },
                    { ingredientId: ingredients.salsaTomate.id,  quantity: 200,  unit: 'MILLILITER', order: 5 },
                    { ingredientId: ingredients.mozarella.id,    quantity: 250,  unit: 'GRAM',       order: 6 },
                    { ingredientId: ingredients.oregano.id,      quantity: 1,    unit: 'TEASPOON',   order: 7 },
                ],
            },
            steps: {
                create: [
                    { order: 1, title: 'Hacer la masa',    description: 'Mezclar harina, levadura, sal y aceite. Agregar agua tibia de a poco hasta formar una masa lisa. Amasar 10 minutos.', durationMin: 15 },
                    { order: 2, title: 'Dejar leudar',     description: 'Cubrir con un repasador y dejar reposar en un lugar cálido por 1 hora, hasta que duplique su tamaño.', durationMin: 60 },
                    { order: 3, title: 'Armar la pizza',   description: 'Estirar la masa en la pizzera aceitada. Cubrir con salsa de tomate, mozzarella y orégano.' },
                    { order: 4, title: 'Hornear',          description: 'Llevar al horno precalentado a 250°C por 15 minutos o hasta que los bordes estén dorados.', durationMin: 15 },
                ],
            },
        },

        // EMPANADAS DE CARNE. autor: home
        {
            title: 'Empanadas de Carne Criollas',
            description: 'Empanadas argentinas con el relleno bien jugoso y especiado.',
            difficulty: 'MEDIUM',
            prepTimeMinutes: 60,
            cookTimeMinutes: 25,
            servings: 6,
            tags: ['argentina', 'carne', 'horno'],
            authorId: users.home.id,
            mealId: meals.empanadas.id,
            ingredients: {
                create: [
                    { ingredientId: ingredients.harina0000.id,   quantity: 500,  unit: 'GRAM',       order: 1 },
                    { ingredientId: ingredients.manteca.id,      quantity: 100,  unit: 'GRAM',       order: 2 },
                    { ingredientId: ingredients.huevo.id,        quantity: 1,    unit: 'UNIT',       order: 3 },
                    { ingredientId: ingredients.sal.id,          quantity: 1,    unit: 'TEASPOON',   order: 4 },
                    { ingredientId: ingredients.carneMolida.id,  quantity: 500,  unit: 'GRAM',       order: 5 },
                    { ingredientId: ingredients.cebolla.id,      quantity: 2,    unit: 'UNIT',       order: 6 },
                    { ingredientId: ingredients.pimiento.id,     quantity: 1,    unit: 'UNIT',       order: 7 },
                    { ingredientId: ingredients.pimentonDulce.id,quantity: 1,    unit: 'TEASPOON',   order: 8 },
                    { ingredientId: ingredients.aceiteOliva.id,  quantity: 2,    unit: 'TABLESPOON', order: 9 },
                ],
            },
            steps: {
                create: [
                    { order: 1, title: 'Hacer la masa',    description: 'Unir harina, manteca blanda, huevo y sal. Amasar hasta obtener una masa tierna. Dejar reposar 20 minutos en la heladera.', durationMin: 25 },
                    { order: 2, title: 'Preparar el relleno', description: 'Rehogar cebolla y pimiento en aceite. Agregar la carne molida y cocinar. Condimentar con sal, pimienta y pimentón. Dejar enfriar.', durationMin: 20 },
                    { order: 3, title: 'Armar las empanadas', description: 'Estirar la masa y cortar discos de 12 cm. Poner una cucharada de relleno en cada uno y repulgar bien.' },
                    { order: 4, title: 'Hornear',          description: 'Pintar con huevo batido y hornear a 200°C por 25 minutos hasta que estén doradas.', durationMin: 25 },
                ],
            },
        },

        // RISOTTO DE POLLO. autor: chef
        {
            title: 'Risotto de Pollo y Espinaca',
            description: 'Un risotto cremoso con pollo tierno y espinaca fresca. Perfecto para una cena elegante.',
            difficulty: 'HARD',
            prepTimeMinutes: 15,
            cookTimeMinutes: 35,
            servings: 2,
            tags: ['italiano', 'cremoso', 'pollo'],
            authorId: users.chef.id,
            mealId: meals.risotto.id,
            ingredients: {
                create: [
                    { ingredientId: ingredients.arroz.id,        quantity: 320,  unit: 'GRAM',       order: 1, notes: 'tipo arborio o carnaroli' },
                    { ingredientId: ingredients.pollo.id,        quantity: 300,  unit: 'GRAM',       order: 2, notes: 'en cubos pequeños' },
                    { ingredientId: ingredients.espinaca.id,     quantity: 100,  unit: 'GRAM',       order: 3 },
                    { ingredientId: ingredients.cebolla.id,      quantity: 1,    unit: 'UNIT',       order: 4, notes: 'picada fina' },
                    { ingredientId: ingredients.ajo.id,          quantity: 2,    unit: 'UNIT',       order: 5, notes: 'dientes' },
                    { ingredientId: ingredients.caldoPollo.id,   quantity: 1,    unit: 'LITER',      order: 6, notes: 'caliente' },
                    { ingredientId: ingredients.cremaDoble.id,   quantity: 100,  unit: 'MILLILITER', order: 7 },
                    { ingredientId: ingredients.quesoRallado.id, quantity: 50,   unit: 'GRAM',       order: 8 },
                    { ingredientId: ingredients.aceiteOliva.id,  quantity: 2,    unit: 'TABLESPOON', order: 9 },
                    { ingredientId: ingredients.sal.id,          quantity: 1,    unit: 'TO_TASTE',   order: 10 },
                    { ingredientId: ingredients.pimienta.id,     quantity: 1,    unit: 'PINCH',      order: 11 },
                ],
            },
            steps: {
                create: [
                    { order: 1, title: 'Dorar el pollo',      description: 'Sellar el pollo en una sartén con aceite a fuego alto. Reservar.', durationMin: 5 },
                    { order: 2, title: 'Sofrito base',        description: 'En la misma sartén, rehogar cebolla y ajo a fuego medio hasta transparentar.', durationMin: 5 },
                    { order: 3, title: 'Tostar el arroz',     description: 'Agregar el arroz y cocinar 2 minutos removiendo constantemente hasta que esté ligeramente translúcido.', durationMin: 2 },
                    { order: 4, title: 'Incorporar el caldo', description: 'Agregar el caldo caliente de a cucharones, de a uno por vez, revolviendo constantemente y esperando que se absorba antes del siguiente. Proceso de 20 minutos.', durationMin: 20 },
                    { order: 5, title: 'Terminar el risotto', description: 'Cuando el arroz esté al dente, incorporar el pollo reservado, la espinaca, la crema y el queso rallado. Salpimentar y servir de inmediato.', durationMin: 3 },
                ],
            },
        },
    ]

    for (const data of recipes) {
        await prisma.recipe.create({ data })
    }
}