export async function seedIngredients(prisma) {
    const names = {
        harina000:      'Harina 000',
        harina0000:     'Harina 0000',
        levaduraSeca:   'Levadura seca',
        azucar:         'Azucar',
        sal:            'Sal',
        polvoHornear:   'Polvo para hornear',

        manteca:        'Manteca',
        lecheEntera:    'Leche entera',
        cremaDoble:     'Crema doble',
        mozarella:      'Mozzarella',
        quesoRallado:   'Queso rallado',

        huevo:          'Huevo',

        carneMolida:    'Carne molida',
        pollo:          'Pechuga de pollo',

        cebolla:        'Cebolla',
        ajo:            'Ajo',
        tomate:         'Tomate',
        pimiento:       'Pimiento rojo',
        espinaca:       'Espinaca',

        aceiteOliva:    'Aceite de oliva',
        salsaTomate:    'Salsa de tomate',

        oregano:        'Orégano',
        pimienta:       'Pimienta negra',
        pimentonDulce:  'Pimentón dulce',

        caldoPollo:     'Caldo de pollo',
        arroz:          'Arroz',
    }

    const entries = await Promise.all(
        Object.entries(names).map(([key, name]) =>
            prisma.ingredient
                .upsert({ where: { name }, update: {}, create: { name } })
                .then((record) => [key, record])
        )
    )

    return Object.fromEntries(entries)
}