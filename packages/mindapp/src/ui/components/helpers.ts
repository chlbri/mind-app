import { useFlow } from './FlowChart.context';

export const observer = (id: string) => (el: HTMLDivElement) => {
  const service = useFlow();
  
  const resize = new ResizeObserver(entries => {
    const el = entries[0].contentRect;
    if (!el) return;

    service.send({
      type: 'RESIZE',
      payload: { id, size: { width: el.width, height: el.height } },
    });
  });

  resize.observe(el);

  return () => {
    resize.unobserve(el);
    resize.disconnect();
  };
};
