import {
  component$,
  Resource,
  useClientEffect$,
  useResource$,
  useSignal,
  useStore,
  useStyles$,
  useTask$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { fetchCharacters } from "~/api/getCharacters";
import CoolStylesCSS from "../cool-styles.css?inline";

interface SimpleObject {
  fruits: { banana: number; apple: number };
  vegetables: { tomato: number; broccoli: number };
}

export default component$(() => {
  useStyles$(CoolStylesCSS);

  const stringStore = useSignal("String");
  const numberStore = useSignal(1);
  const dinnerState = useSignal(false);

  const simpleObject = useStore<SimpleObject>(
    {
      fruits: {
        banana: 10,
        apple: 5,
      },
      vegetables: {
        tomato: 7,
        broccoli: 14,
      },
    },
    { recursive: true }
  );

  useClientEffect$(
    () => {
      // Solo lo hacemos disponible en el cliente
      console.log("Hola desde el cliente, navegador");
      setInterval(() => {
        numberStore.value++;
      }, 3000);
    },
    { eagerness: "visible" }
  );

  useTask$(() => {
    // Primero lo hacemos disponible desde el servidor y luego lo podemos recoger en el cliente
    console.log("Hola desde el servidor, terminal");
  });

  useTask$(({ track }) => {
    // Podemos mirar cambios pero se verán tan solo en el navegador, cliente,
    // ya que la reactividad es una característica solamente propia del cliente.
    track(() => simpleObject.fruits.apple);

    // La primera vez estará en el servidor, pero luego en el cliente
    console.log("Las manzanas han cambiado");
  });

  const allCharacters = useResource$<string[]>(({ cleanup }) => {
    // A good practice is to use `AbortController` to abort the fetching of data if
    // new request comes in. We create a new `AbortController` and register a `cleanup`
    // function which is called when this function re-runs.
    const controller = new AbortController();
    cleanup(() => controller.abort());

    // Fetch the data and return the promises.
    return fetchCharacters(controller);
  });

  const sum = (a: number, b: number) => a + b;

  // Si no tenemos el recursive: true,
  // se va a quedar tan solo en el primer nivel del objeto.

  return (
    <div>
      <section class="bottom-line">
        <h1>
          Hooks Básicos de Qwik <span class="lightning">⚡️</span>
        </h1>
      </section>
      <section>
        <h2>1. Hook useSignal</h2>
        <p>
          Lo usamos para almacenar <strong>un único valor</strong>. Funciona con
          los tipos primitivos y con objetos no muy complejos (sin nesting, por
          ejemplo).
        </p>
        <div>
          <p>
            Nombre de la variable: <strong>{stringStore.value}</strong>.
          </p>
          <button onClick$={() => (dinnerState.value = !dinnerState.value)}>
            Cambiar estado de la cena
          </button>
          <p>¿Está la cena hecha? {dinnerState.value.toString()}</p>
        </div>
      </section>
      <section>
        <h2>2. Hook useStore</h2>
        <p>
          Le damos un objeto inicial, y nos lo convierte en reactivo. Esto
          quiere decir que <strong>podemos actualizar sus valores</strong>, que
          no son fijos. Y al hacerlo, otros componentes que dependen de ese
          valor <strong>también serán actualizados</strong>.
        </p>
        <div>
          <p>
            Número de plátanos: <strong>{simpleObject.fruits.banana}</strong>.
          </p>
          <p>
            Número de manzanas: <strong>{simpleObject.fruits.apple}</strong>.
          </p>
          <p>
            Número de tomates: <strong>{simpleObject.vegetables.tomato}</strong>
            .
          </p>
          <p>
            Número de brócolis:{" "}
            <strong>{simpleObject.vegetables.broccoli}</strong>.
          </p>
          <p>
            Suma de manzanas + plátanos:{" "}
            <strong>
              {sum(simpleObject.fruits.banana, simpleObject.fruits.apple)}
            </strong>
          </p>
          <button onClick$={() => simpleObject.fruits.apple++}>
            Añade una manzana
          </button>
        </div>
      </section>
      <section>
        <h2>3. Hook useClientEffect$</h2>
        <p>Es un método que funciona tan solo en el cliente.</p>
        <div>
          <p>Los console logs los tenemos en la consola.</p>
          <p>
            Este numero se incrementa cada tres segundos:{" "}
            <strong>{numberStore.value}</strong>.
          </p>
        </div>
      </section>
      <section>
        <h2>4. Hook useTask$</h2>
        <p>
          Es un método que funciona tanto en el servidor como en el cliente.
        </p>
        <p>Nos permite hacer un watch de un elemento (track).</p>
        <p>
          Si le echas un vistazo al código, verás que "Las manzanas han
          cambiado" se escribirá una vez en la terminal y a partir de ahí en el
          navegador cada vez que la variable cambie.
        </p>
      </section>
      <section class="bg-gray">
        <h2>5. Hook useStyles$</h2>
        <p>
          Es un método de carga de estilos con lazy load tan solo si es
          necesario.
        </p>
      </section>
      <section>
        <h2>6. Hook useResource$</h2>
        <p>
          Es un método que nos permite hacer <strong>fetch de APIs</strong> y
          que además nos permite de una forma muy sencilla personalizar los
          estados de error y loading. Se utiliza con el componente{" "}
          <strong>Resource</strong>, también de Qwik.
        </p>
        <Resource
          value={allCharacters}
          onPending={() => <>Cargando...</>}
          onRejected={(error) => <>Error: {error.message}</>}
          onResolved={(users) => (
            <ul>
              {users.slice(0, 5).map((user: any) => (
                <li>
                  {user.firstName} {user.lastName}
                </li>
              ))}
            </ul>
          )}
        />
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
