import { addLabActions77 } from './labActions77.js';
import '../../styles/lab77.css';
import { request } from '../../api/client.js';

const normalize = v => String(v ?? '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
const readableDate = v => new Date(v).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });

/** Conecta los botones EXISTENTES de Exámenes y análisis a la API real de laboratorios. */
export async function attachPatientExamBooking75() {
  const buttons = [...document.querySelectorAll('.p66-exam-book')];
  if (!buttons.length) return;

  for (const button of buttons) {
    button.disabled = true;
    button.textContent = 'Buscando horarios…';
  }

  let slots, orders;
  try {
    [slots, orders] = await Promise.all([
      request('/lab73/slots'),
      request('/lab73/my/orders')
    ]);
  } catch (e) {
    for (const button of buttons) {
      button.textContent = 'Programar examen';
      button.disabled = true;
      const info = document.createElement('small');
      info.textContent = `No se pudieron cargar los horarios: ${e.message}`;
      info.style.color = '#ae3e2c';
      button.parentElement?.appendChild(info);
    }
    return;
  }

  const orderMap = new Map((orders.items || []).map(o => [String(o.id), o]));

  for (const button of buttons) {
    const orderId = String(button.dataset.examId || '');
    const order = orderMap.get(orderId);
    const parent = button.parentElement;
    if (!parent) continue;
    button.textContent = 'Programar examen';

    const hint = document.createElement('small');
    hint.style.display = 'block';
    hint.style.marginTop = '6px';
    hint.style.maxWidth = '260px';

    if (order?.booking?.status === 'scheduled') {
      button.style.display = 'none';
      addLabActions77(parent, order, slots.items || []);
      continue;
    }

    if (!order || order.status !== 'requested' || (order.booking && order.booking.status !== 'cancelled')) {
      button.disabled = true;
      hint.textContent = order?.booking ? 'Este examen ya tiene una reserva.' : 'Esta orden no admite una nueva programación.';
      parent.insertBefore(hint, button);
      continue;
    }

    const available = (slots.items || []).filter(s =>
      s.isActive && s.available > 0 && normalize(s.examType) === normalize(order.title)
    );
    if (!available.length) {
      button.disabled = true;
      hint.textContent = 'Aún no hay horarios disponibles para este examen. El administrador debe habilitarlos.';
      parent.insertBefore(hint, button);
      continue;
    }

    const select = document.createElement('select');
    select.setAttribute('aria-label', `Horario para ${order.title}`);
    select.style.width = '100%';
    select.style.maxWidth = '300px';
    select.style.padding = '8px';
    select.style.marginBottom = '8px';
    select.style.border = '1px solid #b8d6df';
    select.style.borderRadius = '8px';
    select.add(new Option('Selecciona fecha y sede', ''));
    for (const slot of available) {
      select.add(new Option(`${readableDate(slot.startsAt)} · ${slot.siteName} · ${slot.available} cupo(s)`, slot.id));
    }
    parent.insertBefore(select, button);
    parent.insertBefore(hint, button);
    button.disabled = false;

    button.addEventListener('click', async () => {
      if (!select.value) { hint.textContent = 'Selecciona una fecha y sede.'; return; }
      if (!window.confirm(`¿Confirmar reserva del examen «${order.title}» en el horario elegido?`)) return;
      button.disabled = true;
      button.textContent = 'Reservando…';
      hint.textContent = '';
      try {
        await request(`/lab${order.booking?.status === 'cancelled' ? '77/my/orders/' : '73/my/orders/'}${encodeURIComponent(orderId)}/${order.booking?.status === 'cancelled' ? 'rebook' : 'book'}`, {
          method: 'POST', body: { slotId: select.value }
        });
        window.alert('Examen programado correctamente. La reserva quedó registrada.');
        window.location.reload();
      } catch (err) {
        hint.textContent = err.message || 'No se pudo completar la reserva.';
        button.disabled = false;
        button.textContent = 'Programar examen';
      }
    });
  }
}
